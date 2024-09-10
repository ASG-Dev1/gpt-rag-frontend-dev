import { Outlet, NavLink, Link } from "react-router-dom";
  
import github from "../../assets/github.svg";
import asgpt from "../../assets/asgpt.png";
import styles from "./Layout.module.css";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <img height="70px" src={asgpt}></img>
                        <h3 className={styles.headerTitle}></h3>
                    </Link>
                    <nav>
                        {
                        // <ul className={styles.headerNavList}>
                        //     <li>
                        //         <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                        //             Chat
                        //         </NavLink>
                        //     </li>
                        //     <li className={styles.headerNavLeftMargin}>
                        //         <NavLink to="/qa" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                        //             Ask a question
                        //         </NavLink>
                        //     </li>
                        //     <li className={styles.headerNavLeftMargin}>
                        //         <a href="https://aka.ms/entgptsearch" target={"_blank"} title="Github repository link">
                        //             <img
                        //                 src={github}
                        //                 alt="Github logo"
                        //                 aria-label="Link to github repository"
                        //                 width="20px"
                        //                 height="20px"
                        //                 className={styles.githubLogo}
                        //             />
                        //         </a>
                        //     </li>
                        // </ul>
    }
                    </nav>
                    {/* <h4 className={styles.headerRightText}>ASG-GPT</h4> */}
                </div>
            </header>

            <Outlet />
        </div>
    );
};


export default Layout;