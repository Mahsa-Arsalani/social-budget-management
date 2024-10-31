import { useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from "prop-types";


function Auth(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
   

    props.login(username, password)
      .then ( () => navigate( "/" ) )
      .catch( (err) => {
        if(err.message === "Unauthorized")
          setErrorMessage("Invalid username and/or password");
        else
          setErrorMessage(err);
        setShow(true);
      });
  };

  return (
    <Row className="mt-3 vh-100 justify-content-md-center">
      <Col md={4} >
        <h1 className="pb-3">Login</h1>
        <Form onSubmit={handleSubmit}>
          <Alert
                dismissible
                show={show}
                onClose={() => setShow(false)}
                variant="danger">
                {errorMessage}
          </Alert>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={username} placeholder="Enter the email."
              onChange={(ev) => setUsername(ev.target.value)}
              required={true}
            />
          </Form.Group>
            <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password} placeholder="Enter the password."
              onChange={(ev) => setPassword(ev.target.value)}
              required={true} 
              />
          </Form.Group>
          <Button className="mt-3" type="submit">Login</Button>
        </Form>
      </Col>
    </Row>
  )
}

Auth.propTypes = {
  login: PropTypes.func,
}

export default Auth;


