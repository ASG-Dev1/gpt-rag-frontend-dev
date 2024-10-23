import { Outlet, NavLink, Link } from "react-router-dom";
import { useMenu } from '../../context/MenuContext';
import asgpt from "../../assets/asgpt.png";
import styles from "./Layout.module.css";
import btnStyles from '../../components/Common/Button.module.css';
import { BiShowAlt, BiHide } from "react-icons/bi";

const Layout = () => {
    const { toggleMenu } = useMenu();

    const historyClicked = () => {
        console.log("Checkpoint in Layout");
    };

    console.log('Layout component rendered, toggleMenu:', toggleMenu); // Debugging

    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <img height="70px" src={asgpt} alt="ASGPT Logo" />
                        <h3 className={styles.headerTitle}></h3>
                    </Link>
                    <button
                        className={`${btnStyles.buttonStructure} ${btnStyles.commandBtn} ${btnStyles.btn}`}
                        onClick={() => {
                            toggleMenu();
                            historyClicked();
                        }}
                    >
                        <BiHide color="#fff" size="25px" />
                        <span className={styles.text}>History</span>
                    </button>
                </div>
            </header>
            <Outlet />
        </div>
    );
};

export default Layout;
