import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Home from '../pages/home';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { path: '', element: <Home /> }
      ],
    },
  ],
  { basename: '/lubanno7-univer-sheet-demo' }
);

export default router;