<?php
session_start();
session_unset(); // supprime toutes les variables de session
session_destroy(); // détruit la session
header("Location: /Aurora/front-end/interfaces/authentification/http://localhost/aurora/front-end/interfaces/authentification/aurora-login-page.html");
exit();
?>