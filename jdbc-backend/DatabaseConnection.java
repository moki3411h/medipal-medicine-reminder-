import java.sql.*;

public class DatabaseConnection {
    public static void main(String[] args) {
        try {
            // JDBC Connection to MySQL
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/medipal_db",
                "root",
                "password"
            );
            System.out.println("✅ JDBC Connected to Database!");
            conn.close();
        } catch (Exception e) {
            System.out.println("Error: " + e);
        }
    }
}
