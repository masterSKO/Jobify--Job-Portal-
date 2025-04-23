package com.jobportal.repository;

import com.jobportal.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUser_Id(Long userId);
    List<JobApplication> findByJob_Id(Long jobId);
    boolean existsByJob_IdAndUser_Id(Long jobId, Long userId);
} 