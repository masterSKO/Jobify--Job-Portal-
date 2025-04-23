import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { getAllJobs, searchJobs } from '../services/jobService';
import JobCard from '../components/JobCard';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Check if there are any search parameters
        if (filters.title || filters.location || filters.type) {
          const results = await searchJobs(filters);
          setJobs(results);
        } else {
          const results = await getAllJobs();
          setJobs(results);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update the URL with search parameters
    setSearchParams(filters);
  };

  const handleClearFilters = () => {
    // Clear all filters
    setFilters({
      title: '',
      location: '',
      type: ''
    });
    
    // Update URL to remove search parameters
    setSearchParams({});
  };

  return (
    <Container>
      <h1 className="mb-4">Browse Jobs</h1>
      
      {/* Search and Filter Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>What</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Job title, keywords, or company"
                    name="title"
                    value={filters.title}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Where</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="City, state, or remote"
                    name="location"
                    value={filters.location}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full Time</option>
                    <option value="Part-time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={1} className="d-flex align-items-end">
                <Form.Group className="mb-3 w-100">
                  <Button variant="primary" type="submit" className="w-100">
                    Search
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Results */}
      {loading ? (
        <div className="text-center py-5">
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length > 0 ? (
        <div>
          <p>{jobs.length} jobs found</p>
          <Row>
            {jobs.map((job) => (
              <Col md={6} key={job.id} className="mb-4">
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <div className="text-center py-5">
          <p>No jobs found matching your criteria.</p>
          <Button variant="outline-primary" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </Container>
  );
};

export default Jobs; 