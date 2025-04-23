package com.jobportal.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String userType; // JOBSEEKER or COMPANY
    
    private String phone;
    private String location;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<JobApplication> applications = new HashSet<>();
} 