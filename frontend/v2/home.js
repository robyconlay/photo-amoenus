'use strict';

function LoginButton(props) {
  return (
    <button onClick={props.onClick}>
      Login
    </button>
  );
}
function LogoutButton(props) {
  return (
    <button onClick={props.onClick}>
      Logout
    </button>
  )
}

class LoginControl extends React.Component {
  constructor(props) {
    super(props);
    this.handleLoginClick = this.handleLoginClick.bind(this);
    this.handleLogoutClick = this.handleLogoutClick.bind(this);
    this.state = { isLoggedIn: false };
  }

  handleLoginClick() {
    this.setState({ isLoggedIn: true });
  }

  handleLogoutClick() {
    this.setState({ isLoggedIn: false });
  }

  render() {
    const isLoggedIn = this.state.isLoggedIn;
    return (
      <div>
        {isLoggedIn
          ? <LogoutButton onClick={this.handleLogoutClick} />
          : <LoginButton onClick={this.handleLoginClick} />}
      </div>
    );
  }
}

function NavItems() {
  const options = ["Home", "Searchlocation", "Addlocation", "Favourites", "Login"];
  const navItems = options.map((op) => {
    let link = op.toLowerCase() + ".html";
    return (
      <div key={op} className="navItem">
        <a href={link} className="navlink">{op}</a>
      </div>
    )
  });
  return (
    <div className="navItems">
      {navItems}
      <LoginControl />
    </div>
  );
}
class TopNav extends React.Component {
  render() {
    return (
      <div className="topnav">
        <img src="logo.png" className="logo" width="100" height="100" />
        <NavItems />
      </div>
    );
  }
}

ReactDOM.render(
  <TopNav />,
  document.getElementById('topnav')
);
