package Ecom.Model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import Ecom.Enum.OrderStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "Orders")
public class Orders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(name = "order_date")
    private LocalDateTime orderDate;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private double totalAmount;

    @OneToMany( cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    private List<OrderItem> orderItem= new ArrayList<>();

    @OneToOne
    @JoinColumn(name="Payment_id")
    private Payment payment;


    @OneToOne
    @JoinColumn(name="ShippingDetails_id")
    private ShippingDetails shippingDetails;

    // Getters and Setters
    public Integer getOrderId() { return orderId; }
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public List<OrderItem> getOrderItem() { return orderItem; }
    public void setOrderItem(List<OrderItem> orderItem) { this.orderItem = orderItem; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public ShippingDetails getShippingDetails() { return shippingDetails; }
    public void setShippingDetails(ShippingDetails shippingDetails) { this.shippingDetails = shippingDetails; }



}