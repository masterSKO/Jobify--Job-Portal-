package com.jobportal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @ManyToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime appliedDate;
    
    private String status; // PENDING, ACCEPTED, REJECTED
    
    @Column(length = 1000)
    private String coverLetter;
    
    private String resumeUrl;
} 