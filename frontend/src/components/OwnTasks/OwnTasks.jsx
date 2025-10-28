import { useEffect, useState, useContext } from "react";
import { Modal, ListGroup, Button, Container, Row, Col, Image, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function OwnTasks() {
  const navigator = useNavigate();
  const [tasks, setTasks] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const params = useParams();
  const dataContext = useContext(DataContext);

  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function getData() {
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/own_tasks`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        setTasks(response.data);
      } catch (e) {

      }
    }

    getData();
  }, [])

  return (<>
    {tasks !== null &&
      <Container>
        <h2 className="mb-4">Задачи</h2>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">Название</th>
              <th scope="col">Описание</th>
              <th scope="col">Дата начала</th>
              <th scope="col">Дата окончания</th>
              <th scope="col">Статус</th>
              <th scope="col">Приоритет</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(item => <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.starting_date}</td>
              <td>{item.ending_date}</td>
              <td>{item.status}</td>
              <td>{item.priority}</td>
              <td>
                <div className="d-flex justify-content-end" style={{gap: 10}}>
                  <Button
                    style={{width: '38px'}}
                    variant="warning"
                    size="sm"
                    title="Изменить статус"
                    onClick={(e) => navigator(`/change_status/${item.id}`)}
                  >
                    &#9989;
                  </Button>
                  <Button
                    style={{width: '38px'}}
                    variant="warning"
                    size="sm"
                    title="Перейти к задаче"
                    onClick={(e) => navigator(`/tasks/${item.id}`)}
                  >
                    &#127981;
                  </Button>
                  {(dataContext.data?.profile !== null && dataContext.data?.profile.role === 'admin') &&
                    <Button
                      style={{width: '38px'}}
                      variant="outline-danger"
                      size="sm"
                      title="Удалить"
                      onClick={(e) => deleteTaskModal(item.id)}
                    >
                      &#10005;
                    </Button>
                  }
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </Container>
    }
  </>);
}