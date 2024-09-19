import { Outlet, NavLink, Link } from "react-router-dom";
  
import github from "../../assets/github.svg";
import asgpt from "../../assets/asgpt.png";
import styles from "./Layout.module.css";
import btnStyles from '../../components/Common/Button.module.css'
import { BiShowAlt } from "react-icons/bi";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                <button className={`${btnStyles.buttonStructure} ${btnStyles.commandBtn}`} > {/*onClick={toggleChatHistory}*/}
                        <BiShowAlt size='1.5625rem' /> Historial
                    </button>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <img height="70px" src={asgpt}></img>
                        <h3 className={styles.headerTitle}></h3>
                    </Link>
                </div>
            </header>

            <Outlet />
        </div>
    );
};


export default Layout;
