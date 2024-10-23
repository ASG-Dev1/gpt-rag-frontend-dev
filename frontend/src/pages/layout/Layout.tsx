import { Outlet, NavLink, Link } from "react-router-dom";
import { useContext, useEffect } from 'react'

import github from "../../assets/github.svg";
import asgpt from "../../assets/asgpt.png";
import styles from "./Layout.module.css";
import btnStyles from '../../components/Common/Button.module.css'
import { BiShowAlt, BiHide } from "react-icons/bi";
import { useChatHistory } from "../../components/ChatHistory/ChatHistoryContext";

const Layout = () => {
    const { isHistoryVisible, toggleHistoryVisibility } = useChatHistory();;


    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <Link to="/" className={styles.headerTitleContainer}>
                        <img height="70px" src={asgpt}></img>
                        <h3 className={styles.headerTitle}></h3>
                    </Link>
                    <button className={`${btnStyles.buttonStructure} ${btnStyles.commandBtn}`} onClick={toggleHistoryVisibility}>
                        {isHistoryVisible ? (
                            <><BiHide color="#fff" size="25px" /><span className={styles.text}>Hide History</span></>
                        ) : (
                            <><BiShowAlt color="#fff" size="25px" /><span className={styles.text}>Show History</span></>
                        )}
                    </button>
                </div>
            </header>

            <Outlet />
        </div>
    );
};


export default Layout;
