import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Sector } from "recharts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./centercard.css";

const Centercard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [showPieChart, setShowPieChart] = useState(false); // Toggle state for visualization
  const [activeIndex, setActiveIndex] = useState(0); // For custom active shape

  // Load search parameters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchInput(params.get("search") || "");
    setFilterType(params.get("type") || "");
    setFilterCity(params.get("city") || "");

    if (params.get("search")) {
      fetchBreweries(params.get("search"));
    } else {
      fetchBreweries("");
    }
  }, [location.search]);

  // Fetch breweries based on search input
  const fetchBreweries = async (query) => {
    setIsLoading(true);
    const response = await fetch(
      `https://api.openbrewerydb.org/v1/breweries/search?query=${query}`
    );
    const data = await response.json();
    setSearchResults(Array.isArray(data) ? data : []); 
    setIsLoading(false);
  };

  const updateSearch = (searchValue) => {
    setSearchInput(searchValue);
    const params = new URLSearchParams(location.search);
    params.set("search", searchValue);
    navigate(`?${params.toString()}`);
    fetchBreweries(searchValue);
  };

  const updateFilters = (type, city) => {
    setFilterType(type);
    setFilterCity(city);
    const params = new URLSearchParams(location.search);
    if (type) params.set("type", type); else params.delete("type");
    if (city) params.set("city", city); else params.delete("city");
    navigate(`?${params.toString()}`);
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
    percentage: ((breweryTypeData[type] / filteredResults.length) * 100).toFixed(2),
  }));

  // Custom active shape for PieChart
  const renderActiveShape = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percentage } = props;
    return (
      <g>
      <text x={cx} y={cy} dy={2} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy} dy={25} textAnchor="middle" fill="#fff">{`Count: ${payload.count}`}</text>
      <text x={cx} y={cy} dy={40} textAnchor="middle" fill="#fff">{`(${percentage}%)`}</text>
      </g>
    );
  };

  return (
    <div className="centercard">
      <header className="header">
        <h1>Let's grab a beer!!!</h1>
      </header>

      <div className="main-content">
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
            onChange={(e) => updateSearch(e.target.value)}
          />

          {/* Filters */}
          <div className="filters">
            <select
              value={filterType}
              onChange={(e) => updateFilters(e.target.value, filterCity)}
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
              onChange={(e) => updateFilters(filterType, e.target.value)}
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
                      <Link to={`/brewery/${brewery.id}${location.search}`}>View Details</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!isLoading && searchInput !== "" && filteredResults.length === 0 && (
            <p>No results found for "{searchInput}".</p>
          )}
        </section>

        {/* Toggle visualization section */}
        <aside className="dashboard-section">
          <h3>Brewery Types Distribution</h3>
          <button onClick={() => setShowPieChart(!showPieChart)}>
            Toggle to {showPieChart ? "Bar Chart" : "Pie Chart"}
          </button>

          {showPieChart ? (
            <PieChart width={300} height={300}>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              />
            </PieChart>
          ) : (
            <BarChart width={300} height={200} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Centercard;
