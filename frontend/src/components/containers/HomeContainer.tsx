import React, { useEffect, useState } from 'react';
import { Galleries } from '../../types/Galleries';
import { dynamoService } from '../services/dynamoService';
import Gallery from '../views/Gallery';
import Home from '../views/Home';


const HomeContainer = () => {
    const [galleries, setGalleries] = useState<Galleries[]>(new Array<Galleries>());
    const downloadGalleriesCallback = (success: boolean, err?: AWS.AWSError, data?: AWS.DynamoDB.DocumentClient.QueryOutput) => {
        if (success && data !== undefined) {
            var _galleries: Galleries[] = new Array<Galleries>();
            data.Items?.forEach((item, index) => {
                var _galleryName: string = item.name;
                var _galleryID: string = item.gallery_id;
                if (_galleryName !== undefined && _galleryID !== undefined) {
                    var _gallery: Galleries = {
                        ID: _galleryID,
                        Name: _galleryName,
                        Active: true,
                    }
                    _galleries.push(_gallery);

                }
            });
            setGalleries(_galleries);
        }

    };

    const onGalleryRefresh = () => {
        dynamoService.getGalleries(downloadGalleriesCallback);
    }

    useEffect(() => {
        const getGalleryData = () => {
            dynamoService.getGalleries(downloadGalleriesCallback);
        };
        console.log('Now calling getGalleries');
        getGalleryData();
    }, []);

    return (
        <Home
            galleries={galleries}
            onGalleryRefresh={onGalleryRefresh}
        />
    )
}

export default HomeContainer;