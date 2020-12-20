import React from 'react'
import './style.css'
import '../fontawesome-free-5.15.1-web/js/all.js'

function Logo() {
    return (
        <li className="logo">
            <a href='/home' className="nav-link">
                <span className="link-text">Photo Amoenus</span>
                <i className="fas fa-camera"></i>
            </a>
        </li>
    )
}


function NavItem(props) {
    return (
        <li className="nav-item">
            <a href={props.path} className="nav-link">
                <i className={props.svgName}></i>
                <span className="link-text">{props.text}</span>
            </a>
        </li>
    )
}


function Sidebar(props) {
    return (
        <nav className="navbar">
            <ul className="navbar-nav">
                <Logo />
                <NavItem
                    path="/home"
                    svgName="fas fa-home"
                    text="Home"
                />
                <NavItem
                    path="/locations"
                    svgName="fas fa-search-location"
                    text="Locations"
                />
                <NavItem
                    path="/favourites"
                    svgName="fas fa-heart"
                    text="Favourites"
                />
                <NavItem
                    path="/login"
                    svgName="fas fa-sign-in-alt"
                    text="Login"
                />
            </ul>
        </nav>
    )
}

export default Sidebar;