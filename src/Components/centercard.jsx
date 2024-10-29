import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Link } from "react-router-dom";
import "./centercard.css"; // Your CSS file for styling
const Centercard = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCity, setFilterCity] = useState("");

  // Function to fetch breweries based on search input
  const fetchBreweries = async (query) => {
    setIsLoading(true);
    const response = await fetch(
      `https://api.openbrewerydb.org/v1/breweries/search?query=${query}`
    );
    const data = await response.json();
    setSearchResults(Array.isArray(data) ? data : []); // Ensure data is an array
    setIsLoading(false);
  };

  // Fetch all breweries on component mount
  useEffect(() => {
    fetchBreweries("");
  }, []);

  // Function to handle search input change
  const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    if (searchValue !== "") {
      fetchBreweries(searchValue);
    } else {
      setSearchResults([]);
    }
  };

  // Filter results based on type and city
  const filteredResults = (Array.isArray(searchResults) ? searchResults : []).filter((brewery) => {
    return (
      (filterType === "" || brewery.brewery_type === filterType) &&
      (filterCity === "" || brewery.city === filterCity)
    );
  });

  // Prepare data for visualization
  const breweryTypeData = filteredResults.reduce((acc, brewery) => {
    const type = brewery.brewery_type;
    acc[type] = acc[type] ? acc[type] + 1 : 1;
    return acc;
  }, {});

  const chartData = Object.keys(breweryTypeData).map((type) => ({
    name: type,
    count: breweryTypeData[type],
  }));

  return (
    <div className="centercard">
      <header className="header">
        <h1>Let's grab a beer!!!</h1>
      </header>

      <div className="main-content">
        {/* Main content section on the left */}
        <section className="card-section">
          <div className="stats-card">
            <h3>Total Breweries: {filteredResults.length}</h3>
            <h4>Total Micro Breweries: {filteredResults.filter(b => b.brewery_type === "micro").length}</h4>
            <h4>Total Cities: {new Set(filteredResults.map(b => b.city)).size}</h4>
          </div>

          {/* Search input */}
          <input
            id="search-bar"
            type="text"
            placeholder="Search for breweries..."
            value={searchInput}
            onChange={(e) => searchItems(e.target.value)}
          />

          {/* Filters */}
          <div className="filters">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="micro">Micro</option>
              <option value="regional">Regional</option>
              <option value="brewpub">Brewpub</option>
            </select>
            <input
              type="text"
              placeholder="Filter by city..."
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />
          </div>

          {/* Loading indicator */}
          {isLoading && <p>Loading...</p>}

          {/* Display search results */}
          {filteredResults.length > 0 && (
            <table className="astro-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Brewery Type</th>
                  <th>Country</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((brewery) => (
                  <tr key={brewery.id}>
                    <td>{brewery.name}</td>
                    <td>{brewery.address_1 || "N/A"}</td>
                    <td>{brewery.city}</td>
                    <td>{brewery.brewery_type}</td>
                    <td>{brewery.country}</td>
                    <td>
                    <Link to={`/brewery/${brewery.id}`}>View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* If no results */}
          {!isLoading && searchInput !== "" && filteredResults.length === 0 && (
            <p>No results found for "{searchInput}".</p>
          )}
        </section>

        {/* Dashboard section with Recharts bar chart */}
        <aside className="dashboard-section">
          <h3>Brewery Types Distribution</h3>
          <BarChart width={300} height={200} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </aside>
      </div>
    </div>
  );
};

export default Centercard;
