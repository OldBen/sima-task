<?php

class DataProvider 
{
    private PDO $db;

    public function __construct() 
    {
        try {
            $this->db = new PDO('mysql:host=mariadb;dbname=mysql', 'root', 'password');
        } catch (\PDOException $e) {
            return null;
        }
    } 

    public function getAddressesByCities(): string
    {
        $stm = $this->db->query('
            SELECT city, COUNT(*) AS orders
            FROM orders_address
            GROUP BY city;
        ');
        $points = $stm->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($points);
    }

}


$provider = new DataProvider();
echo $provider->getAddressesByCities();