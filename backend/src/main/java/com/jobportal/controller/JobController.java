package com.jobportal.controller;

import com.jobportal.model.Job;
import com.jobportal.model.User;
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
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @GetMapping("/search")
    public List<Job> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type) {
        return jobRepository.searchJobs(title, location, type);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        return jobRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody Job job) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty() || !userOptional.get().getUserType().equals("COMPANY")) {
            return ResponseEntity.badRequest().body("Only companies can post jobs");
        }

        job.setPostedBy(userOptional.get());
        job.setPostedDate(LocalDateTime.now());
        return ResponseEntity.ok(jobRepository.save(job));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job jobDetails) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        return jobRepository.findById(id)
                .map(job -> {
                    if (!job.getPostedBy().getEmail().equals(email)) {
                        return ResponseEntity.badRequest().body("You can only update your own jobs");
                    }
                    
                    job.setTitle(jobDetails.getTitle());
                    job.setDescription(jobDetails.getDescription());
                    job.setLocation(jobDetails.getLocation());
                    job.setType(jobDetails.getType());
                    job.setSalary(jobDetails.getSalary());
                    job.setExperience(jobDetails.getExperience());
                    
                    return ResponseEntity.ok(jobRepository.save(job));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        return jobRepository.findById(id)
                .map(job -> {
                    if (!job.getPostedBy().getEmail().equals(email)) {
                        return ResponseEntity.badRequest().body("You can only delete your own jobs");
                    }
                    
                    jobRepository.delete(job);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
} 