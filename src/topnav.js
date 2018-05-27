import React, { Component } from 'react';
import logo from './logo.svg';
//import Search from './search';

export default class TopNav extends Component {
  render() {
    return (
		<nav className="navbar navbar-expand-md fixed-top shadow bg-white ">
      <a className="navbar-brand" href="/"><img src={logo} alt="logo" className="logo"/></a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
        <i className="fa fa-bars fa-lg"></i>
      </button>
      <div className="collapse navbar-collapse " id="navbarCollapse">
				<form className="form-inline  m-auto">
          <input className="form-control border border-success border-right-0 rounded-left py-2" type="text" placeholder="Search" aria-label="Search" />
          <button className="btn btn-success rounded-right py-2" type="submit">搜 索</button>
        </form>
        <ul className="navbar-nav mt-2 mt-md-0 ">
					<li className="nav-item">
            <a className="nav-link " >ETH : 2324.93</a>
          </li>
					<li className="nav-item mr-5">
            <a className="nav-link " >CNY : 893434.00</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href=""><i className="fa fa-th fa-lg"></i></a>
          </li>
					<li className="nav-item">
            <a className="nav-link" href=""><i className="fa fa-bell fa-lg"></i></a>
          </li>
          
        </ul>
      </div>
    </nav>
    );
  }
}
