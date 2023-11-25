import React, { useEffect, useState } from 'react'
import { dynamoService } from './services/dynamoService';
import { S3Service } from './services/S3Service';
import { S3BucketParams } from '../types/S3BucketParams';
import { Progress } from 'aws-sdk/lib/request';
import GalleryUploadModal from './views/GalleryUploadModal';
import ProgressBar from 'react-bootstrap/ProgressBar';

type Props = {
    onGalleryListRefresh: () => void;
};

const S3_BUCKET = process.env.REACT_APP_S3_BUCKET ?? '';
const REGION = 'us-east-1';

const myBucket = S3Service.configureBucket(S3_BUCKET, REGION);


const Upload = (props: Props) => {
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileNames, setFileNames] = useState<string[]>(new Array<string>());
    const [modalShow, setModalShow] = useState<boolean>(false);

    useEffect(() => {
        setFileNames(downloadFiles());
    }, []);

    const handleFileInput = (e: { target: { files: FileList | any; }; }) => {
        if (e != null) {
            setSelectedFile(e.target.files);
            setShowProgress(true);
        }
    }

    const uploadFile = () => {
        let files: FileList | any = selectedFile;
        for (let i = 0; i < files.length; i++) {
            const fileID = dynamoService.insertRecord("photos", files[i].name);
            // Try to grab file extension on filename to add to Id for S3 upload.
            var extensionArray = files[i].name.split('.');
            var extension = extensionArray[extensionArray.length - 1];
            const fileName = fileID + '.' + extension;
            const params: S3BucketParams = {
                ACL: 'bucket-owner-full-control',
                Body: files[i],
                Bucket: S3_BUCKET,
                Key: fileName
            };
            console.log(files[i].name);

            if (fileName !== null && fileName !== '') {
                const _callBackFunction = (evt: Progress) => {
                    setProgress(Math.round((evt.loaded / evt.total) * 100));
                }
                S3Service.uploadPhoto(myBucket, params, fileName, _callBackFunction);
            }
        }
    }

    const downloadFiles = (): string[] => {
        var _fileNames: string[] = new Array<string>();
        const _callBackFunction = (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => {
            if (success && data !== undefined) {

                data.Items?.forEach((item, index) => {
                    var _photoId: string = item.photo_id;
                    console.log('photo id: ' + _photoId);
                    if (_photoId !== undefined) {
                        _fileNames.push(_photoId);

                    }
                });
                console.log('FileNames: ' + _fileNames);
            }

        }
        dynamoService.getGalleryRecords('1', _callBackFunction);
        return _fileNames;
    }

    return <div>
        {showProgress && (progress < 100) && <div><ProgressBar animated now={progress} /></div>}
        <input type="file" onChange={handleFileInput} multiple />
        <button onClick={() => uploadFile()}> Upload to S3</button>
        <button onClick={() => setFileNames(downloadFiles())}>Download Files</button>
        <button onClick={() => setModalShow(true)}>Create Gallery</button>

        <GalleryUploadModal show={modalShow} setShow={() => setModalShow(true)} onHide={() => {
            setModalShow(false);
            setFileNames(downloadFiles());
            props.onGalleryListRefresh();
        }} />

        {fileNames &&
            <ul>
                {fileNames.map((name, index) => (
                    <li className='list-group-item' key={index}>
                        {name}
                    </li>
                ))}
            </ul>

        }
    </div>

}

export default Upload;



