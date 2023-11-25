import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import { dynamoService } from '../services/dynamoService';
import { S3BucketParams } from '../../types/S3BucketParams';
import { Progress } from 'aws-sdk/lib/request';
import { S3Service } from '../services/S3Service';
import { PhotoUpload } from '../../types/PhotoUpload';
import { ProgressBar } from 'react-bootstrap';

type PropsType = {
    onHide: () => void;
    show: boolean;
    setShow: () => void;
};
const GalleryUploadModal = (props: PropsType) => {
    const [filesToUpload, setFilesToUpload] = useState(null);
    const [galleryName, setGalleryName] = useState('');
    const [photoNames, setPhotoNames] = useState<PhotoUpload[]>(new Array<PhotoUpload>());
    const S3_BUCKET = process.env.REACT_APP_S3_BUCKET ?? '';
    const REGION = 'us-east-1';

    const incrementPhotoProgress = (index: number, value: number) => {
        var _newPhoto: PhotoUpload = {
            Name: photoNames[index].Name,
            Progress: value
        };
        setPhotoNames(existingItems => {
            return [
                ...existingItems.slice(0, index),
                _newPhoto,
                ...existingItems.slice(index + 1),
            ]
        });
    }
    const onSubmit = async (event: any) => {
        // Configure S3 for upload
        const myBucket = S3Service.configureBucket(S3_BUCKET, REGION);

        // Now create gallery in dynamo.
        if (galleryName !== '') {
            var _completedFiles = 0;
            var _galleryId = dynamoService.insertGallery('galleries', galleryName);
            let files: FileList | any = filesToUpload;
            for (let i = 0; i < files.length; i++) {
                console.log(files[i].name);
                // And insert the gallery_photos
                var _photoId = dynamoService.insertGalleryPhoto(_galleryId, files[i].name);
                // Try to grab file extension on filename to add to Id for S3 upload.
                var extensionArray = files[i].name.split('.');
                var extension = extensionArray[extensionArray.length - 1];
                const fileName = _photoId + '.' + extension;
                var galleryPhotoName = `${_galleryId}/${fileName}`;
                const params: S3BucketParams = {
                    ACL: 'bucket-owner-full-control',
                    Body: files[i],
                    Bucket: S3_BUCKET,
                    Key: galleryPhotoName
                };
                console.log(files[i].name);

                if (fileName !== null && fileName !== '') {
                    const _callBackFunction = (evt: Progress) => {
                        var _progressValue = Math.round((evt.loaded / evt.total) * 100);
                        incrementPhotoProgress(i, _progressValue);
                    }
                    S3Service.uploadPhoto(myBucket, params, fileName, _callBackFunction).then((response) => {
                        _completedFiles++;
                    });
                }
            };
            if (files.length > 0 && _completedFiles === files.length) {
                props.onHide();
            }
        }
    }
    const onFileSelection = (event: any) => {
        console.log(event.target.files);
        if (event?.target?.files?.length > 0) {
            var _photos: PhotoUpload[] = new Array<PhotoUpload>();
            for (let i = 0; i < event.target.files.length; i++) {
                console.log('photo name: ' + event.target.files[i].name);
                var _photo: PhotoUpload = {
                    Name: event.target.files[i].name,
                    Progress: 0
                };
                _photos.push(_photo);
            }
            if (_photos.length > 0) {
                setPhotoNames(_photos);
            }
        }
        setFilesToUpload(event.target.files);
    }
    const handleGalleryName = (event: any) => {
        setGalleryName(event.target.value);
    }
    return (
        <Modal size="lg" show={props.show} onHide={props.onHide} aria-labelledby="gallery-modal-title-vcenter">
            <Modal.Header closeButton>
                <Modal.Title id="gallery-modal-title-vcenter">
                    Create Gallery
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Form onSubmit={onSubmit}>
                        <Form.Group className="mb-3" controlId="galleryName">
                            <Form.Label>Gallery Name</Form.Label>
                            <br />
                            <Form.Control type="text" placeholder="Enter Gallery Name Here" onChange={handleGalleryName} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="galleryPhotos">
                            <Form.Label>Photos for Gallery</Form.Label>
                            <Form.Control type="file" multiple onChange={onFileSelection} />
                        </Form.Group>
                        {photoNames.map((photo, index) => {
                            return (
                                <Row>
                                    <Col xs={12} md={8}>
                                        {photo.Name}
                                    </Col>
                                    <Col xs={6} md={4}>
                                        <ProgressBar animated now={photo.Progress} />
                                    </Col>
                                </Row>
                            );
                        })}
                        {/* {props.fileNames.map((file, index) => (
                            <li className='list-group-item' key={index}>
                                {file.Photo_Id}
                            </li>
                        ))} */}

                        <Button variant="primary" onClick={onSubmit}>Create</Button>
                    </Form>
                </Container>
            </Modal.Body>

        </Modal>
    )
}

export default GalleryUploadModal;