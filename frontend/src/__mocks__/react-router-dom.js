const React = require('react');

module.exports = {
  __esModule: true,
  BrowserRouter: ({ children }) => React.createElement(React.Fragment, null, children),
  Routes: ({ children }) => React.createElement(React.Fragment, null, children),
  Route: ({ element }) => element || null,
  Link: ({ children }) => React.createElement(React.Fragment, null, children),
  useLocation: () => ({ pathname: '/' }),
  useNavigate: () => (() => {}),
  useParams: () => ({}),
};
