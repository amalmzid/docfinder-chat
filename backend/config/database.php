<?php
class Database {
    private $host = "localhost";
    private $port = "3306";
    private $username = "root";
    private $password = "";
    private $database = "heal-u";
    public $conn;

    // connect database
    public function __construct() {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->database, $this->port);
        
        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        }
    }

    public function getConnection() {
        return $this->conn;
    }

    public function closeConnection() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
?>
