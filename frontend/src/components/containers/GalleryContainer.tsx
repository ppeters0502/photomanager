import React, { useEffect, useState } from 'react';
import Gallery from '../views/Gallery';
import { useParams } from 'react-router-dom';
import { dynamoService } from '../services/dynamoService';
import { GalleryPhoto } from '../../types/GalleryPhoto';
import { S3Service } from '../services/S3Service';

const GalleryContainer = () => {
    const { id } = useParams();
    const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(new Array<GalleryPhoto>());
    const [galleryName, setGalleryName] = useState<string>();
    const [deleteGalleryPhotos, setDeleteGalleryPhotos] = useState<GalleryPhoto[]>(new Array<GalleryPhoto>());
    const [checkedState, setCheckedState] = useState(new Array<boolean>());
    const [deleteModalShow, setDeleteModalShow] = useState<boolean>(false);
    const [photoURLs, setPhotoURLs] = useState<string[]>(new Array<string>());

    const _callBackFunction = (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => {
        if (success && data !== undefined) {
            var _fileNames: GalleryPhoto[] = new Array<GalleryPhoto>();
            data.Items?.forEach((item, index) => {
                var _photoId: string = item.photo_id;
                var _galleryId: string = item.gallery_id;
                var _photoName: string = item.photo_name ?? 'None';
                console.log('photo id: ' + _photoId);
                if (_photoId !== undefined && _galleryId !== undefined) {
                    var _photo: GalleryPhoto = {
                        Gallery_Id: _galleryId,
                        Photo_Id: _photoId,
                        Photo_Name: _photoName
                    };
                    _fileNames.push(_photo);
                }
            });
            setGalleryPhotos(_fileNames);
            var updatedStates = new Array<boolean>();
            _fileNames.map((file, index) => {
                updatedStates.push(false);
            });
            setCheckedState(updatedStates);
        }
    };

    const updateCheckedState = (photoIndex: number | undefined) => {
        const updatedCheckedState = checkedState.map((item, index) =>
            index === photoIndex ? !item : item
        );
        setCheckedState(updatedCheckedState);
    }

    const _galleryNameCallbackFunction = (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => {
        if (success && data !== undefined) {
            var _galleryName: string = '';
            data.Items?.forEach((item) => {
                if (item !== undefined) {
                    _galleryName = item.name;
                }
            });
            console.log('Gallery Name:' + _galleryName);
            setGalleryName(_galleryName);
        }
    }

    const _getGalleryPhotoUrlsCallback = (err?: AWS.AWSError, data?: any) => {
        if (!err && data) {
            setPhotoURLs(data);
        }
    }

    const deletePhotoPrompt = (): Array<string> => {
        const filesToDelete = new Array<string>();
        checkedState.map((item, index) => {
            if (item) {
                filesToDelete.push(galleryPhotos[index].Photo_Name);
            }
        });
        return filesToDelete;
    }

    const toggleDeleteModalShow = (show: boolean) => {
        setDeleteModalShow(show);
    }

    const _deletePhotoDBCallbackFunction = (err: AWS.AWSError, data: AWS.DynamoDB.DocumentClient.DeleteItemOutput) => {
        if (!err && data !== undefined) {

        }
    }

    const deletePhotos = () => {
        // First find out which photos we are deletingg
        const filesToDelete = new Array<GalleryPhoto>();
        checkedState.map((item, index) => {
            if (item) {
                filesToDelete.push(galleryPhotos[index]);
            }
        });

        // Need to delete GalleryPhoto, Photo and S3 record.
        // First, GalleryPhoto
        filesToDelete.map((item, index) => {
            try {
                debugger;
                dynamoService.deleteGalleryPhoto(item.Gallery_Id, item.Photo_Id, _deletePhotoDBCallbackFunction);
                // then photo.
                dynamoService.deletePhoto(item.Photo_Id, _deletePhotoDBCallbackFunction);

                // Try to grab file extension on filename to add to Id for S3 upload.
                var extensionArray = item.Photo_Name.split('.');
                var extension = extensionArray[extensionArray.length - 1];
                var fileName = item.Gallery_Id + '/' + item.Photo_Id + '.' + extension;
                // Then S3
                S3Service.deletePhoto(fileName);
            }
            catch (e) {
                console.log(e);
            }
            finally {
                toggleDeleteModalShow(false);
            }


        });
    }



    const deleteGallery = (galleryId: string) => {
        if (galleryId == undefined) {
            return '';
        }

    }

    useEffect(() => {
        const getPhotos = () => {
            if (id !== undefined) {
                dynamoService.getGalleryRecords(id, _callBackFunction);
                dynamoService.getGalleryById(id, _galleryNameCallbackFunction);
                S3Service.listGalleryPhotos(id, _getGalleryPhotoUrlsCallback);
            }
        };
        getPhotos();
    }, []);

    return (
        <Gallery
            fileNames={galleryPhotos}
            GalleryName={galleryName}
            checkedState={checkedState}
            updateCheckedState={updateCheckedState}
            deletePhotoPrompt={deletePhotoPrompt}
            deletePhotos={deletePhotos}
            deleteModalShow={deleteModalShow}
            toggleDeleteModalShow={toggleDeleteModalShow}
            photoURLs={photoURLs}
        />
    );
}

export default GalleryContainer;