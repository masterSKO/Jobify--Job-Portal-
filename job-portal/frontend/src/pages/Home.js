import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Container, Form, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAllJobs } from '../services/jobService';
import JobCard from '../components/JobCard';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    title: '',
    location: '',
    type: ''
  });

  useEffect(() => {
    // Fetch featured jobs
    const fetchJobs = async () => {
      try {
        const jobs = await getAllJobs();
        // Show just a few jobs on the homepage
        setFeaturedJobs(jobs.slice(0, 4));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Redirect to jobs page with search params
    window.location.href = `/jobs?title=${searchParams.title}&location=${searchParams.location}&type=${searchParams.type}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 mb-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-4 mb-md-0">
              <h1 className="display-4 fw-bold">Find Your Dream Job</h1>
              <p className="lead">Search thousands of jobs and find the perfect match for your career.</p>
              <Button as={Link} to="/jobs" variant="light" size="lg" className="mt-3">Browse All Jobs</Button>
            </Col>
            <Col md={6}>
              <Card className="shadow-lg">
                <Card.Body>
                  <Form onSubmit={handleSearch}>
                    <Form.Group className="mb-3">
                      <Form.Label>What are you looking for?</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Job title, keywords, or company"
                        name="title"
                        value={searchParams.title}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Where?</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="City, state, or remote"
                        name="location"
                        value={searchParams.location}
                        onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Type</Form.Label>
                      <Form.Select name="type" value={searchParams.type} onChange={handleChange}>
                        <option value="">All Types</option>
                        <option value="FULL_TIME">Full Time</option>
                        <option value="PART_TIME">Part Time</option>
                        <option value="CONTRACT">Contract</option>
                        <option value="INTERNSHIP">Internship</option>
                      </Form.Select>
                    </Form.Group>
                    <Button variant="primary" type="submit" className="w-100">Search Jobs</Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Jobs Section */}
      <Container>
        <h2 className="text-center mb-4">Featured Jobs</h2>
        {loading ? (
          <p className="text-center">Loading jobs...</p>
        ) : featuredJobs.length > 0 ? (
          <Row>
            {featuredJobs.map((job) => (
              <Col md={6} key={job.id}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-center">No jobs found. Check back later for new opportunities.</p>
        )}
        <div className="text-center mt-4">
          <Button as={Link} to="/jobs" variant="outline-primary">View All Jobs</Button>
        </div>
      </Container>

      {/* How It Works Section */}
      <div className="bg-light py-5 mt-5">
        <Container>
          <h2 className="text-center mb-5">How It Works</h2>
          <Row className="g-4">
            <Col md={4} className="text-center">
              <div className="bg-white p-4 rounded shadow-sm h-100">
                <div className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '50px', height: '50px' }}>1</div>
                <h4>Search Jobs</h4>
                <p>Browse through our extensive list of jobs or use our search filters to find exactly what you're looking for.</p>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="bg-white p-4 rounded shadow-sm h-100">
                <div className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '50px', height: '50px' }}>2</div>
                <h4>Apply Online</h4>
                <p>Submit your application with just a few clicks. Upload your resume and cover letter to stand out.</p>
              </div>
            </Col>
            <Col md={4} className="text-center">
              <div className="bg-white p-4 rounded shadow-sm h-100">
                <div className="bg-primary text-white rounded-circle d-inline-flex justify-content-center align-items-center mb-3" style={{ width: '50px', height: '50px' }}>3</div>
                <h4>Get Hired</h4>
                <p>Companies will review your application and contact you if you're a good fit for the position.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default Home; 