package Ecom.Config;

import Ecom.Enum.UserAccountStatus;
import Ecom.Enum.UserRole;
import Ecom.Model.Product;
import Ecom.Model.User;
import Ecom.Repository.ProductRepository;
import Ecom.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(ProductRepository productRepository, 
                                     UserRepository userRepository, 
                                     PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialize Admin User if not exists
            if (userRepository.findByEmail("admin@ecom.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@ecom.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("System");
                admin.setLastName("Admin");
                admin.setPhoneNumber("1234567890");
                admin.setRole(UserRole.ROLE_ADMIN);
                admin.setRegisterTime(LocalDateTime.now());
                admin.setUserAccountStatus(UserAccountStatus.ACTIVE);
                userRepository.save(admin);
                System.out.println("Default Admin created: admin@ecom.com / admin123");
            }

            // Initialize Sample Products if empty
            if (productRepository.count() == 0) {
                // Shortened descriptions to meet @Size(min=10, max=50) constraint
                
                saveProduct(productRepository, "Premium UltraBook", 
                    "Sleek and powerful silver laptop.", 1299.99, "electronics", "/images/laptop.png");

                saveProduct(productRepository, "SmartPhone X", 
                    "Latest smartphone with abstract display.", 999.99, "electronics", "/images/smartphone.png");

                saveProduct(productRepository, "Noise Cancel Pro", 
                    "Professional noise cancelling headphones.", 299.99, "gadgets", "/images/headphones.png");

                saveProduct(productRepository, "Gaming Console Z", 
                    "Next-gen console with 4K graphics.", 499.99, "gadgets", "/images/console.png");

                saveProduct(productRepository, "HealthWatch Pro", 
                    "Track your health and fitness in style.", 199.99, "gadgets", "/images/watch.png");

                saveProduct(productRepository, "RGB Mech Keyboard", 
                    "RGB keyboard with mechanical switches.", 149.99, "gadgets", "/images/keyboard.png");

                // New categories from screenshot
                saveProduct(productRepository, "Kids Fashion Set", 
                    "Stylish and colorful kids clothing set.", 49.99, "fashion", "/images/kids.png");

                saveProduct(productRepository, "Kitchenware Set", 
                    "Premium stainless steel pots and pans.", 199.99, "home", "/images/kitchen.png");

                saveProduct(productRepository, "Smart 4K TV", 
                    "Large 4K Smart TV with thin bezels.", 799.99, "electronics", "/images/tv.png");

                System.out.println("Sample products initialized successfully.");
            }
        };
    }

    private void saveProduct(ProductRepository repo, String name, String desc, Double price, String cat, String img) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setCategory(cat);
        p.setImageUrl(img);
        p.setAvailable(true);
        repo.save(p);
    }
}
