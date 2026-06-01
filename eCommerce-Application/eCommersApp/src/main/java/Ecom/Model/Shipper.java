package Ecom.Model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.annotation.Generated;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;



@Entity
@Table(name = "Shipper")
public class Shipper {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer shipperId;

    @NotNull(message = "Name Is Mandatory ,can Not Be Null")
	@NotBlank(message = "Name Is Mandatory")
    @Column(name = "name")
    private String name;

    @NotNull(message = "phoneNumber Is Mandatory ,can Not Be Null")
   	@NotBlank(message = "phoneNumber Is Mandatory")
    @Size(min=10,max = 12)
    @Column(name = "phoneNumber")
    private String phoneNumber;
    
    @JsonIgnore
    @OneToMany(mappedBy = "shipper",fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private List<ShippingDetails> shippingDetails= new ArrayList<>();;

    // Getters and Setters
    public Integer getShipperId() { return shipperId; }
    public void setShipperId(Integer shipperId) { this.shipperId = shipperId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public List<ShippingDetails> getShippingDetails() { return shippingDetails; }
    public void setShippingDetails(List<ShippingDetails> shippingDetails) { this.shippingDetails = shippingDetails; }


  
}

