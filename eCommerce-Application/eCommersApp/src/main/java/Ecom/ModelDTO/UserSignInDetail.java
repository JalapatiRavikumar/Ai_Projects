package Ecom.ModelDTO;

public class UserSignInDetail {
    Integer id;
    String firstNAme;
    String lastName;
    String signinStatus;

    public UserSignInDetail() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFirstNAme() { return firstNAme; }
    public void setFirstNAme(String firstNAme) { this.firstNAme = firstNAme; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getSigninStatus() { return signinStatus; }
    public void setSigninStatus(String signinStatus) { this.signinStatus = signinStatus; }

}
