<?php

class Comment 
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
    
    public function getComments(?int $id): string
    {
        $query = "
            SELECT * 
            FROM comments
        ";
        if (!empty($id)) $query .= "WHERE id < :id";
        $query .= "
            ORDER BY id DESC LIMIT 8;
        ";
        $stm = $this->db->prepare($query);
        if (!empty($id)) $stm->bindParam(':id', $id);
        $stm->execute();
        $comments = $stm->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($comments);
    }

    public function addComment(string $comment): bool
    {
        $stm = $this->db->prepare("
            INSERT INTO comments (content)
            VALUES ( :comment )
        ");
        $stm->bindParam(':content', $comment, PDO::PARAM_STR);
        return $stm->execute(['comment' => $comment]);
    }
}

$com = new Comment();
$id = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $com->addComment($_POST['comment']);
} elseif (!empty($_GET["id"]) && is_numeric($_GET["id"])) {
    $id = (int) $_GET["id"];
}
echo $com->getComments($id);