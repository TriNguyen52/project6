import React from "react";
import "./dashboard.css";

const Dashboard = ({ onSearchClick }) => {
    return (
        <div className="Item">
            <ul>
                <li><h3>Dashboard</h3></li>
                <li><h3 onClick={onSearchClick} style={{cursor: 'pointer'}}>Search</h3></li>
                <li><h3>About</h3></li>
            </ul>
        </div>
    );
};

export default Dashboard;
