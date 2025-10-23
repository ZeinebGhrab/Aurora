<?php
session_start();
session_unset(); // supprime toutes les variables de session
session_destroy(); // détruit la session
header("Location:../../front-end/interfaces/authentification/aurora-sign-page.html");
exit();
?>