import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BreweryDetail = () => {
  const { id } = useParams();
  const [brewery, setBrewery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBrewery = async () => {
      try {
        const response = await fetch(`https://api.openbrewerydb.org/v1/breweries/${id}`);
        if (!response.ok) throw new Error("Failed to fetch brewery details.");
        const data = await response.json();
        setBrewery(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrewery();
  }, [id]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!brewery) return <p>Brewery not found.</p>;

  return (
    <div>
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>{brewery.name}</h2>
      <p>Address: {brewery.street || "N/A"}</p>
      <p>City: {brewery.city}</p>
      <p>State: {brewery.state}</p>
      <p>Postal Code: {brewery.postal_code}</p>
      <p>Country: {brewery.country}</p>
      <p>Type: {brewery.brewery_type}</p>
      <p>
        Website:{" "}
        {brewery.website_url ? (
          <a href={brewery.website_url} target="_blank" rel="noopener noreferrer">
            {brewery.website_url}
          </a>
        ) : (
          "N/A"
        )}
      </p>
      <p>Phone: {brewery.phone || "N/A"}</p>
    </div>
  );
};

export default BreweryDetail;
