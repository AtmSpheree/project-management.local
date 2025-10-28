import { useEffect, useState, useContext } from "react";
import { Modal, ListGroup, Button, Container, Row, Col, Image, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router";
import { DataContext } from '../../context/dataContext';

export default function Tasks() {
  const navigator = useNavigate();
  const [tasks, setTasks] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const params = useParams();
  const [sortStarting, setSortStarting] = useState('По возрастанию');
  const [sortEnding, setSortEnding] = useState('По возрастанию');
  const dataContext = useContext(DataContext);

  useEffect(() => {
    if (dataContext.data?.profile === null) {
      navigator('/login');
    }
  }, [dataContext.data?.profile])

  useEffect(() => {
    async function getData() {
      try {
        let data = await fetch(`${import.meta.env.VITE_API_URL}/project_tasks/${params.projectId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        let response = await data.json();
        response.data = response.data.sort((a, b) => {
          let [date_a, date_b] = [new Date(a.starting_date), new Date(b.starting_date)];
          if (sortStarting === 'По убыванию') {
            return date_b - date_a
          } else {
            return date_a - date_b
          }
        })
        response.data = response.data.sort((a, b) => {
          let [date_a, date_b] = [new Date(a.ending_date), new Date(b.ending_date)];
          if (sortEnding === 'По убыванию') {
            return date_b - date_a
          } else {
            return date_a - date_b
          }
        })
        setTasks(response.data);
      } catch (e) {

      }
    }

    getData();
  }, [])

  const deleteTask = async (e) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/tasks/${modalShow}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTasks(tasks.filter(item => item.id !== modalShow))
      setModalShow(false);
    } catch (e) {
      console.log(e)
    }
  }

  const deleteTaskModal = (id) => {
    setModalShow(id);
  }

  useEffect(() => {
    if (tasks !== null) {
      setTasks(JSON.parse(JSON.stringify(tasks)).sort((a, b) => {
        let [date_a, date_b] = [new Date(a.starting_date), new Date(b.starting_date)];
        if (sortStarting === 'По убыванию') {
          return date_b - date_a
        } else {
          return date_a - date_b
        }
      }))
    }
  }, [sortStarting])

  useEffect(() => {
    if (tasks !== null) {
      setTasks(JSON.parse(JSON.stringify(tasks)).sort((a, b) => {
        let [date_a, date_b] = [new Date(a.ending_date), new Date(b.ending_date)];
        if (sortEnding === 'По убыванию') {
          return date_b - date_a
        } else {
          return date_a - date_b
        }
      }))
    }
  }, [sortEnding])

  return (<>
    {tasks !== null &&
      <Container>
        <Form style={{marginBottom: 10}}>
          <Row className="align-items-end">
            <Col md={2}>
              <Form.Label>Сортировка по дате начала</Form.Label>
              <Form.Select
                value={sortStarting}
                onChange={(e) => {setSortStarting(e.target.value)}}
              >
                <option value='По возрастанию'>По возрастанию</option>
                <option value='По убыванию'>По убыванию</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Сортировка по дате окончания</Form.Label>
              <Form.Select
                value={sortEnding}
                onChange={(e) => {setSortEnding(e.target.value)}}
              >
                <option value='По возрастанию'>По возрастанию</option>
                <option value='По убыванию'>По убыванию</option>
              </Form.Select>
            </Col>
          </Row>
        </Form>
        <h2 className="mb-4">Задачи</h2>
        <Button
          variant="primary"
          size="sl"
          title="Добавить проект"
          style={{marginBottom: 10}}
          onClick={(e) => navigator(`/projects/${params.projectId}/add_task`, {state: {prev: `/projects/${params.projectId}/tasks`}})}
        >Добавить задачу</Button>
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
                    title="Перейти к исполнителям"
                    onClick={(e) => navigator(`/contractors/${item.id}`)}
                  >
                    &#128119;
                  </Button>
                  <Button
                    style={{width: '38px'}}
                    variant="warning"
                    size="sm"
                    title="Перейти к проекту"
                    onClick={(e) => navigator(`/projects/${params.projectId}`)}
                  >
                    &#128253;
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
        <Modal show={modalShow !== false} onHide={() => setModalShow(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Удаление задачи</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Вы действительно хотите удалить эту задачу?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={() => deleteTask()}>
              Удалить
            </Button>
            <Button variant="secondary" onClick={() => setModalShow(false)}>
              Отмена
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    }
  </>);
}