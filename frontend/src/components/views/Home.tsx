import React from 'react'
import Header from './Header';
import Footer from './Footer';
import Upload from '../Upload';
import { Container } from 'react-bootstrap';
import { Galleries } from '../../types/Galleries';

type Props = {
  galleries: Galleries[];
  onGalleryRefresh: () => void;
};

function Home(props: Props) {
  return (
    <div>
      <Header />
      <main className="py-3">
        <Container>
          <Upload onGalleryListRefresh={props.onGalleryRefresh} />
          <div>
            <h1>Galleries: </h1>
            {props.galleries &&
              <ul>
                {props.galleries.map((gallery, index) => (
                  <li className='list-group-item' key={index}>
                    <a href={`/gallery/${gallery.ID}`}>{gallery.Name}</a>
                  </li>
                ))}
              </ul>

            }
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  );
}

export default Home;