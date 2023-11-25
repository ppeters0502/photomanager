import { Number } from 'aws-sdk/clients/iot';
import React, { useState } from 'react'
import { Container } from 'react-bootstrap';
import { getOutputFileNames, JsxElement } from 'typescript';
import { GalleryPhoto } from '../../types/GalleryPhoto';
import Checkbox from '../shared/Checkbox';
import PopupAlert from '../shared/PopupAlert';

type Props = {
    GalleryName: string | undefined,
    fileNames: GalleryPhoto[],
    checkedState: boolean[],
    updateCheckedState: (photoIndex: number | undefined) => void,
    deletePhotoPrompt: () => Array<string>;
    deletePhotos: () => void;
    deleteModalShow: boolean;
    toggleDeleteModalShow: (show: boolean) => void;
    photoURLs: string[];
}

const Gallery = (props: Props) => {
    const counter = props.fileNames.length;

    const [filesToDelete, setFilesToDelete] = useState(new Array<string>());
    const [deleteBodyText, setDeleteBodyText] = useState<string>('');

    return (
        <Container>
            <h1>{props.GalleryName}</h1>
            <div>
                {props.fileNames &&
                    <ul>
                        {/* {props.fileNames.map((file, index) => (

                            <li className='list-group-item' key={index}>
                                <input id={file.Photo_Id} type="checkbox" checked={props.checkedState[index]} onChange={() => props.updateCheckedState(index)} />
                                {file.Photo_Id} - {file.Photo_Name}
                            </li>
                        ))} */}
                        {props.photoURLs.map((url, index) => (
                            <li className='list-group-item' key={index}>
                                <img src={url} />
                            </li>
                        ))}
                    </ul>

                }
                <PopupAlert
                    show={props.deleteModalShow}
                    onHide={() => props.toggleDeleteModalShow}
                    id="delete-Modal"
                    headerText="Delete Confirmation"
                    bodyText={deleteBodyText}
                    listItems={filesToDelete}
                    showConfirmation={true}
                    confirmText='Yes'
                    onSubmit={props.deletePhotos} />
                <div>
                    <h2>Files To Delete: </h2>
                    {/* {filesToDelete.map((file, index) => (
                        <p key={index}>{file}</p>
                    ))} */}
                    {props.checkedState.map((check, index) => {
                        if (check === true) {
                            <p key={index}>True</p>
                        }
                        else {
                            <p key={index}>False</p>
                        }
                    })}
                </div>
                <button onClick={() => {
                    var checkedPhotos: Array<string> = props.deletePhotoPrompt();
                    var _tempBody = "Are you sure you want to delete the following " + checkedPhotos.length + " items?";
                    setDeleteBodyText(_tempBody);
                    setFilesToDelete(checkedPhotos);
                    props.toggleDeleteModalShow(true);
                }}>Delete Photos</button>
            </div>

        </Container>
    )
}

export default Gallery;