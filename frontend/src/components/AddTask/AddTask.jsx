import { useEffect, useState, useContext } from "react";
import { Row, Col, Image, Alert, Form, Button, Container } from "react-bootstrap";
import { useNavigate, useParams, useLocation } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function AddTask() {
  const navigator = useNavigate();
  const params = useParams();
  const dataContext = useContext(DataContext);
  const [task, setTask] = useState(null);
  const location = useLocation();
  const [isFormShown, setIsFormShown] = useState(false);
  const [isAlert, setIsAlert] = useState(false);

  const [fields, setFields] = useState({
    name: '',
    description: '',
    starting_date: '',
    ending_date: '',
    status: '',
    priority: ''
  });
  const [errors, setErrors] = useState({
    name: [],
    description: [],
    starting_date: [],
    ending_date: [],
    status: [],
    priority: []
  });
  
  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function doActions() {
      if (params.taskId) {
        try {
          let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (data.status === 404) {
            setIsFormShown({error: true, message: 'Такой задачи не существует.'});
          } else if (data.status === 401) {
            localStorage.removeItem('token');
            dataContext.setData({
              ...dataContext.data,
              profile: null
            });
            navigator('/login')
          } else if (data.status === 403) {
            setIsFormShown({error: true, message: 'У вас нет доступа к этой задаче.'});
          } else {
            setIsFormShown(true);
            let response = await data.json();
            setTask({
              name: response.data.name,
              description: response.data.description,
              starting_date: response.data.starting_date,
              ending_date: response.data.ending_date,
              status: response.data.status,
              priority: response.data.priority
            })
            setFields({
              name: response.data.name,
              description: response.data.description,
              starting_date: response.data.starting_date,
              ending_date: response.data.ending_date,
              status: response.data.status,
              priority: response.data.priority
            })
          }
        } catch (e) {

        }
      } else {
        if (dataContext.data?.profile.role !== "admin") {
          navigator('/');
        } else {
          setIsFormShown(true);
        }
      }
    }

    doActions();
  }, [])

  const onFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.projectId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          name: fields.name,
          description: fields.description,
          starting_date: fields.starting_date,
          ending_date: fields.ending_date,
          status: fields.status,
          priority: fields.priority
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
          name: [],
          description: [],
          starting_date: [],
          ending_date: [],
          status: [],
          priority: [],
          ...response.errors
        });
      } else {
        if (location.state && location.state.prev) {
          navigator(location.state.prev)
        } else {
          navigator(`/tasks/${response.data.id}`);
        }
      }
    } catch (e) {

    }
  }

  const checkSimilarity = () => {
    if (task === null) {
      return true;
    }
    if (fields.name === task.name) {
      if (fields.description === task.description) {
        if (fields.starting_date === task.starting_date) {
          if (fields.ending_date === task.ending_date) {
            if (fields.status === task.status) {
              if (fields.priority === task.priority) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  const onChangeFormSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${params.taskId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({
          name: fields.name,
          description: fields.description,
          starting_date: fields.starting_date,
          ending_date: fields.ending_date,
          status: fields.status,
          priority: fields.priority
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
          name: [],
          description: [],
          starting_date: [],
          ending_date: [],
          status: [],
          priority: [],
          ...response.errors
        });
      } else {
        let response = await data.json();
        setTask({
          name: response.data.name,
          description: response.data.description,
          starting_date: response.data.starting_date,
          ending_date: response.data.ending_date,
          status: response.data.status,
          priority: response.data.priority
        })
        setErrors({
          name: [],
          description: [],
          starting_date: [],
          ending_date: [],
          status: [],
          priority: []
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
    {isFormShown === true &&
      <Container className="mt-4" style={{ maxWidth: '400px' }}>
        <h2 className="mb-4 text-center">{params.taskId ? (dataContext.data?.profile.role !== "admin" ? 'Задача' : 'Редактирование задачи') : 'Добавление задачи'}</h2>
        <Form onSubmit={params.taskId ? onChangeFormSubmit : onFormSubmit}>
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Название</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, name: e.target.value})}
              value={fields.name}
              type="text"
              placeholder="Введите название"
              readOnly={dataContext.data?.profile.role !== "admin"}
              required
              isInvalid={errors.name.length > 0}
            />
            {errors.name.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="description" className="mb-3">
            <Form.Label>Описание</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Введите описание"
              value={fields.description}
              onChange={(e) => setFields({...fields, description: e.target.value})}
              readOnly={dataContext.data?.profile.role !== "admin"}
              isInvalid={errors.description.length > 0}
              required
            />
            {errors.description.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="starting_date" className="mb-3">
            <Form.Label>Дата начала</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, starting_date: e.target.value})}
              value={fields.starting_date}
              readOnly={dataContext.data?.profile.role !== "admin"}
              type="date"
              placeholder="Введите дату начала"
              required
              isInvalid={errors.starting_date.length > 0}
            />
            {errors.starting_date.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="ending_date" className="mb-3">
            <Form.Label>Дата окончания</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, ending_date: e.target.value})}
              value={fields.ending_date}
              type="date"
              placeholder="Введите дату окончания"
              readOnly={dataContext.data?.profile.role !== "admin"}
              required
              isInvalid={errors.ending_date.length > 0}
            />
            {errors.ending_date.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="status" className="mb-3">
            <Form.Label>Статус</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, status: e.target.value})}
              value={fields.status}
              type="text"
              placeholder="Укажите статус"
              readOnly={dataContext.data?.profile.role !== "admin"}
              required
              isInvalid={errors.status.length > 0}
            />
            {errors.status.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group controlId="priority" className="mb-3">
            <Form.Label>Приоритет</Form.Label>
            <Form.Control
              onChange={(e) => setFields({...fields, priority: e.target.value})}
              value={fields.priority}
              type="text"
              placeholder="Укажите приоритет"
              readOnly={dataContext.data?.profile.role !== "admin"}
              required
              isInvalid={errors.priority.length > 0}
            />
            {errors.priority.map((item, index) =>
              <Form.Control.Feedback type="invalid" key={index}>
                {item}
              </Form.Control.Feedback>
            )}
          </Form.Group>
          {(params.taskId && !checkSimilarity() && dataContext.data?.profile.role === "admin") &&
            <Button variant="primary" type="submit" className="w-100" style={{marginBottom: '10px'}}>
              Редактировать задачу
            </Button>
          }

          {isAlert &&
            <Alert variant='success'>
              Запись успешно отредактирована.
            </Alert>
          }
          {(!params.taskId && dataContext.data?.profile.role === "admin") &&
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Добавить
            </Button>
          }
        </Form>
      </Container>
    }
  </>)
}