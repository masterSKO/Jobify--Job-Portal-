package com.jobportal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 2000)
    private String description;
    
    @Column(nullable = false)
    private String company;
    
    private String location;
    private String type; // FULL_TIME, PART_TIME, INTERNSHIP
    private String salary;
    private String experience;
    
    @Column(nullable = false)
    private LocalDateTime postedDate;
    
    @ManyToOne
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL)
    private Set<JobApplication> applications = new HashSet<>();
} 