import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer>
        <Container>
            <Row>
                <Col className="text-center py-3">Copyright &copy; Rob Peters Photography</Col>
            </Row>
        </Container>
    </footer>
  );
};

export default Footer;
