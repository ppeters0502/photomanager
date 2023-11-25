import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import { JsxElement } from 'typescript';

type Props = {
    id: string;
    headerText: string;
    bodyText: string;
    show: boolean;
    onHide: () => void;
    listItems: string[] | undefined;
    showConfirmation: boolean;
    onSubmit: () => void;
    confirmText: string;
};


const PopupAlert = (props: Props) => {
    return (<Modal size="lg" show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
            <Modal.Title id="gallery-modal-title-vcenter">
                {props.headerText}
            </Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Container>
                {props.bodyText}
                {props.listItems !== undefined && props.listItems.length > 0 &&
                    <ul>
                        {props.listItems.map((item, index) => (
                            <li className='list-group-item' key={index}>{item}</li>
                        ))}
                    </ul>
                }
                {props.showConfirmation && <Button variant="primary" onClick={props.onSubmit}>{props.confirmText}</Button>}
            </Container>
        </Modal.Body>
    </Modal>);
}

export default PopupAlert;