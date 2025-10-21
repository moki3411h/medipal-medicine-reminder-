import java.sql.*;

public class MedicineDAO {
    // Save medicine to database using JDBC
    public void saveMedicine(String name, String dosage, String time) {
        try {
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/medipal_db",
                "root",
                "password"
            );
            
            String sql = "INSERT INTO medicines (medicine_name, dosage, reminder_time) VALUES (?, ?, ?)";
            PreparedStatement stmt = conn.prepareStatement(sql);
            stmt.setString(1, name);
            stmt.setString(2, dosage);
            stmt.setString(3, time);
            stmt.executeUpdate();
            
            System.out.println("Medicine saved via JDBC");
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
