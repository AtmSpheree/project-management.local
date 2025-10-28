import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function AddUser() {
  const navigator = useNavigate();
  const params = useParams();
  const [user, setUser] = useState(null);
  const dataContext = useContext(DataContext);
  const location = useLocation();
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const [fields, setFields] = useState({
    fullname: '',
    email: '',
    password: '',
    repeatPassword: ''
  });
  const [errors, setErrors] = useState({
    fullname: [],
    email: [],
    password: [],
    repeatPassword: []
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    } else if (dataContext.data?.profile.role !== "admin") {
      navigator('/');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
      if (params.userId) {
        try {
          let data = await fetch(`${import.meta.env.VITE_API_URL}/users/${params.userId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (data.status === 404) {
            setIsFormShown({error: true, message: 'Такого пользователя не существует.'});
          } else if (data.status === 401) {
            localStorage.removeItem('token');
            dataContext.setData({
              ...dataContext.data,
              profile: null
            });
            navigator('/login')
          } else {
            setIsFormShown(true);
            let response = await data.json();
            setUser({
              fullname: response.data.fullname,
              email: response.data.email,
              password: '',
              repeatPassword: '',
            })
            setFields({
              fullname: response.data.fullname,
              email: response.data.email,
              password: '',
              repeatPassword: '',
            })
          }
        } catch (e) {

        }
      }
    }

    doActions();
  }, [])

  const onFormSubmit = async (e) => {
    e.preventDefault();
    if (fields.password !== fields.repeatPassword) {
      setErrors({
        fullname: [],
        email: [],
        password: [],
        repeatPassword: ["Пароли не совпадают."]
      });
      return;
    }
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          fullname: fields.fullname,
          email: fields.email,
          password: fields.password,
        })
      });
      if (data.status === 401) {
        localStorage.removeItem('token');
        dataContext.setData({
          ...dataContext.data,
          profile: null,
        });
        navigator('/login')
      } else if (data.status === 422) {
        let response = await data.json();
        setErrors({
          fullname: [],
          email: [],
          password: [],
          repeatPassword: [],
          ...response.errors
        });
      } else {
        navigator('/users');
      }
    } catch (e) {

    }
  }

  const checkSimilarity = () => {
    if (user === null) {
      return true;
    }
    if (fields.fullname === user.fullname) {
      if (fields.password === user.password) {
        return true;
      }
    }
    return false;
  }

  const onChangeFormSubmit = async (e) => {
    e.preventDefault();
    if ((fields.password !== "" || fields.repeatPassword !== "") && fields.password !== fields.repeatPassword) {
      setErrors({
        fullname: [],
        email: [],
        password: [],
        repeatPassword: ["Пароли не совпадают."]
      });
      return;
    }
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/users/${params.userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          fullname: fields.fullname,
          ...((() => {
            return fields.password === "" ? {} : {password: fields.password}
          })())
        })
      });
      if (data.status === 401) {
        localStorage.removeItem('token');
        dataContext.setData({
          ...dataContext.data,
          profile: null
        });
        navigator('/login')
      } else if (data.status === 422) {
        let response = await data.json();
        setErrors({
          fullname: [],
          email: [],
          password: [],
          repeatPassword: [],
          ...response.errors
        });
      } else {
        let response = await data.json();
        setUser({
          fullname: response.data.fullname,
          email: response.data.email,
          password: '',
          repeatPassword: ''
        })
        setErrors({
          fullname: [],
          email: [],
          password: [],
          repeatPassword: []
        });
        setIsAlert(true);
        setTimeout(() => setIsAlert(false), 2000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (<>
    {isFormShown.error &&
      <Container
        className="d-flex justify-content-center align-items-center"
      >
        <div className="text-center">
          <h1>{isFormShown.message}</h1>
        </div>
      </Container>
    }
    {((params.userId && isFormShown === true) || (!params.userId)) &&
      <Container className="mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">{params.userId ? 'Редактирование пользователя' : 'Добавление пользователя'}</h2>
        <Form onSubmit={params.userId ? onChangeFormSubmit : onFormSubmit}>
          <Form.Group controlId="fullname" className="mb-3">
            <Form.Label>ФИО</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, fullname: e.target.value})}
              value={fields.fullname}
              type="text"
              placeholder="Введите ФИО"
              required
              isInvalid={errors.fullname.length > 0}
            />
            {errors.fullname.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, email: e.target.value})}
              value={fields.email}
              type="email"
              placeholder="Введите e-mail"
              required={!params.userId}
              readOnly={params.userId}
              isInvalid={errors.email.length > 0}
            />
            {errors.email.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, password: e.target.value})}
              value={fields.password}
              type="password"
              placeholder="Введите пароль"
              required={!params.userId}
              isInvalid={errors.password.length > 0}
            />
            {errors.password.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="repeatPassword" className="mb-3">
            <Form.Label>Повтор пароля</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, repeatPassword: e.target.value})}
              value={fields.repeatPassword}
              type="password"
              placeholder="Введите повтор пароля"
              required={!params.userId}
              isInvalid={errors.repeatPassword.length > 0}
            />
            {errors.repeatPassword.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {(params.userId && !checkSimilarity()) &&
            <Button variant="primary" type="submit" className="w-100" style={{marginBottom: '10px'}}>
              Редактировать запись
            </Button>
          }

          {isAlert &&
            <Alert variant='success'>
              Запись успешно отредактирована.
            </Alert>
          }
          {!params.userId &&
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Добавить
            </Button>
          }
        </Form>
      </Container>
    }
  </>)
}