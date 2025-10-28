import { useContext, useEffect } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { data, Outlet, useNavigate } from "react-router";
import { DataContext } from "../../context/dataContext";

export default function Header({ getProfile }) {
  const navigator = useNavigate();
  const dataContext = useContext(DataContext);

  useEffect(() => {
    getProfile();
  }, [])

  const changeTheme = () => {
    if (dataContext.data?.theme === 'dark') {
      localStorage.setItem('theme', 'light');
      dataContext.setData({
        ...dataContext.data,
        theme: 'light'
      })
    } else {
      localStorage.setItem('theme', 'dark');
      dataContext.setData({
        ...dataContext.data,
        theme: 'dark'
      })
    }
  }

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
      });
      localStorage.removeItem('token');
      dataContext.setData({
        ...dataContext.data,
        profile: null,
        posts: null
      })
      navigator('/login')
    } catch (e) {

    }
  }

  return <>
    {dataContext.data?.profile !== undefined &&
      <>
        <Navbar variant={dataContext.data?.theme} expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand onClick={(e) => navigator('/')} style={{cursor: 'pointer'}} className="d-flex align-items-center">
              <svg height={'40px'} width={'40px'} class="d-inline-block align-top" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill="#000"><path d="m15.3 11.1v8.6h10.7c2.3 0 4.1 1.8 4.1 4.1v3c0 2.3-1.8 4.1-4.1 4.1h-10.7v8.6h10.7c7.1 0 12.8-5.7 12.8-12.8v-2.9c0-7-5.7-12.8-12.8-12.8h-10.7z" mask="url(#a)"></path><path d="m23.5 0-2.2 8.6h-8.6c-2.3 0-4.1 1.8-4.1 4.1v3c0 2.3 1.8 4.1 4.1 4.1h10.7v8.6h-10.6c-7.1 0-12.8-5.7-12.8-12.7v-2.9c0-7.1 5.7-12.8 12.8-12.8z" mask="url(#b)"></path></g>
              </svg>
              <p style={{margin: 0, marginLeft: 10}}>
                Система управления проектами
              </p>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                {dataContext.data?.profile !== null &&
                  <>
                    <Nav.Link onClick={(e) => navigator('/profile')}>Профиль</Nav.Link>
                    {dataContext.data?.profile.role === 'admin' ?
                      <>
                        <Nav.Link onClick={(e) => navigator('/users')}>Пользователи</Nav.Link>
                        <Nav.Link onClick={(e) => navigator('/')}>Проекты</Nav.Link>
                      </>
                    :
                      <>
                        <Nav.Link onClick={(e) => navigator('/own_tasks')}>Мои задачи</Nav.Link>
                      </>
                    }
                  </>
                }
              </Nav>
              <Nav className="ms-auto">
                <Button
                    variant={dataContext.data?.theme === 'dark' ? 'outline-warning' : 'outline-dark'}
                    onClick={changeTheme}
                    className="mb-3"
                >
                  {dataContext.data?.theme === 'dark' ? '☀' : '🌑'}
                </Button>
                {dataContext.data?.profile === null ?
                  <>
                    <Nav.Link onClick={(e) => navigator('/login')}>Вход</Nav.Link>
                  </>
                :
                  <Nav.Link onClick={logout}>Выход</Nav.Link>
                }
                
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Outlet/>
      </>
    }
  </>
}