package com.jobportal.controller;

import com.jobportal.model.Job;
import com.jobportal.model.JobApplication;
import com.jobportal.model.User;
import com.jobportal.repository.JobApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> applyForJob(@RequestBody JobApplication application) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty() || !userOptional.get().getUserType().equals("JOBSEEKER")) {
            return ResponseEntity.badRequest().body("Only job seekers can apply for jobs");
        }

        Optional<Job> jobOptional = jobRepository.findById(application.getJob().getId());
        if (jobOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Job not found");
        }

        if (applicationRepository.existsByJob_IdAndUser_Id(
                application.getJob().getId(), userOptional.get().getId())) {
            return ResponseEntity.badRequest().body("You have already applied for this job");
        }

        application.setUser(userOptional.get());
        application.setJob(jobOptional.get());
        application.setAppliedDate(LocalDateTime.now());
        application.setStatus("PENDING");

        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @GetMapping("/my-applications")
    public List<JobApplication> getMyApplications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        return userRepository.findByEmail(email)
                .map(user -> applicationRepository.findByUser_Id(user.getId()))
                .orElse(List.of());
    }

    @GetMapping("/job/{jobId}")
    public List<JobApplication> getApplicationsForJob(@PathVariable Long jobId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<Job> jobOptional = jobRepository.findById(jobId);
        if (jobOptional.isEmpty()) {
            return List.of();
        }

        if (!jobOptional.get().getPostedBy().getEmail().equals(email)) {
            return List.of();
        }

        return applicationRepository.findByJob_Id(jobId);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        return applicationRepository.findById(id)
                .map(application -> {
                    if (!application.getJob().getPostedBy().getEmail().equals(email)) {
                        return ResponseEntity.badRequest().body("You can only update applications for your own jobs");
                    }
                    
                    application.setStatus(status);
                    return ResponseEntity.ok(applicationRepository.save(application));
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 