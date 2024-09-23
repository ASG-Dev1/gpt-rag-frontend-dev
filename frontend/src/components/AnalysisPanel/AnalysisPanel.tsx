import { Pivot, PivotItem } from "@fluentui/react";
import DOMPurify from "dompurify";

import styles from "./AnalysisPanel.module.css";

// import { SupportingContent } from "../SupportingContent";
import { AskResponse } from "../../api";
import { AnalysisPanelTabs } from "./AnalysisPanelTabs";

interface Props {
    className: string;
    activeTab: AnalysisPanelTabs;
    onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
    activeCitation: string | undefined;
    citationHeight: string;
    answer: AskResponse;
}

const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };



export const AnalysisPanel = ({ answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged }: Props) => {

    const isDisabledThoughtProcessTab: boolean = !answer.thoughts;
    // const isDisabledSupportingContentTab: boolean = !answer.data_points.length;
    const isDisabledCitationTab: boolean = !activeCitation;
    const isDisabledItemsTab: boolean = !answer.thoughts;
    const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);

    const Items1  : AskResponse = answer
    const iframeSrc = `https://docs.google.com/gview?url=${activeCitation}&embedded=true`;


  


    function extractDataFromResponse(response: AskResponse): { [key: string]: string } {
        let input = response.thoughts!;
        let tokens = input.split(' ');
        let result: { [key: string]: string } = {};
        let currentKey = '';
        let currentValue = '';
    
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].endsWith(':')) {
                if (currentKey) {
                    result[currentKey] = currentValue.trim();
                }
                currentKey = tokens[i].slice(0, -1);
                currentValue = '';
            } else {
                currentValue += tokens[i] + ' ';
            }
        }
    
        if (currentKey) {
            result[currentKey] = currentValue.trim();
        }
    
        return result;
    }
    
    const extractedData = extractDataFromResponse(Items1);

    console.log(Items1.data_points);
    return (
        <Pivot
            className={className}
            selectedKey={activeTab}
            
            onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
        >
            {/* <PivotItem
                itemKey={AnalysisPanelTabs.ThoughtProcessTab}
                headerText="Thought process"
                headerButtonProps={isDisabledThoughtProcessTab ? pivotItemDisabledStyle : undefined}
            >
                <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: sanitizedThoughts }}></div>
            </PivotItem> */}
            {/* <PivotItem
                itemKey={AnalysisPanelTabs.SupportingContentTab}
                headerText="Supporting Content"
                headerButtonProps={isDisabledSupportingContentTab ? pivotItemDisabledStyle : undefined}
            >
                <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: "Hi" }}></div>
            </PivotItem> */}
            <PivotItem
                itemKey={AnalysisPanelTabs.Items}
                headerText="Items"
                headerButtonProps={isDisabledItemsTab ? pivotItemDisabledStyle : undefined}
            >
                <div className={styles.thoughtProcess} >
                    
                    <div style={{whiteSpace:'pre-wrap'}}>{Items1.data_points} </div>

                </div>
            </PivotItem>
            <PivotItem
                itemKey={AnalysisPanelTabs.CitationTab}
                headerText="Citation"
                headerButtonProps={isDisabledCitationTab ? pivotItemDisabledStyle : undefined}
                
            >
                
                <iframe title="Citation" src={iframeSrc} width="100%" height={citationHeight}/>

                {/* <iframe title="Citation" src={activeCitation} width="100%" height={citationHeight} /> */}
            </PivotItem>

            
           
        </Pivot>
    );
};





// import React from "react";
// import { Pivot, PivotItem } from "@fluentui/react";
// import DOMPurify from "dompurify";

// import styles from "./AnalysisPanel.module.css";

// import { SupportingContent } from "../SupportingContent";
// import { AskResponse } from "../../api";
// import { AnalysisPanelTabs } from "./AnalysisPanelTabs";

// interface Props {
//     className: string;
//     activeTab: AnalysisPanelTabs;
//     onActiveTabChanged: (tab: AnalysisPanelTabs) => void;
//     activeCitation: string | undefined;
//     citationHeight: string;
//     answer: AskResponse;
// }

// interface State {
//     articles: ArticleOrService[];
// }

// interface ArticleOrService {
//     id: string;
//     title: string;
//     priceInUsDollars: string;
//     providerOrSupplierName: string;
//     sourceName: string;
// }

// const pivotItemDisabledStyle = { disabled: true, style: { color: "grey" } };

// export class AnalysisPanel extends React.Component<Props, State> {
//     constructor(props: Props) {
//         super(props);
//         this.state = {
//             articles: []
//         };
//     }

//     componentDidUpdate(prevProps: Props) {
//         if (prevProps.answer.thoughts !== this.props.answer.thoughts) {
//             const extractedArticles = this.extractInformation(this.props.answer.thoughts!);
//             this.setState({ articles: extractedArticles });
//         }
//     }

//     extractInformation(text: string): ArticleOrService[] {
//         const results: ArticleOrService[] = [];

//         const id = text.match(/Numero Caso:/)?.[1];
//         const tituloRequisicion = text.match(/Titulo Requisicion: (.+?) Categoria/)?.[1];
//         const costoEstimado = text.match(/Costo Estimado:/)?.[1];
//         const nombreSuplidor = text.match(/Nombre Suplidor: /)?.[1];
//         const sourceName = id ? "[" + id + ".txt]" : "";
    
//         if (id && tituloRequisicion && costoEstimado && nombreSuplidor) {
//             results.push({
//                 id: id,
//                 title: tituloRequisicion,
//                 priceInUsDollars: costoEstimado,
//                 providerOrSupplierName: nombreSuplidor,
//                 sourceName: sourceName
//             });
//         }
    
//         return results;
//     }

//     render() {
//         const { answer, activeTab, activeCitation, citationHeight, className, onActiveTabChanged } = this.props;
//         const sanitizedThoughts = DOMPurify.sanitize(answer.thoughts!);
//         const isDisabledThoughtProcessTab: boolean = !answer.thoughts;
//         const isDisabledSupportingContentTab: boolean = !answer.data_points.length;
//         const isDisabledCitationTab: boolean = !activeCitation;
//         const isDisabledItemsTab: boolean = !answer.thoughts;

//         return (
//             <Pivot
//                 className={className}
//                 selectedKey={activeTab}
//                 onLinkClick={pivotItem => pivotItem && onActiveTabChanged(pivotItem.props.itemKey! as AnalysisPanelTabs)}
//             >
//                <PivotItem
//                 itemKey={AnalysisPanelTabs.ThoughtProcessTab}
//                 headerText="Thought process"
//                 headerButtonProps={isDisabledThoughtProcessTab ? pivotItemDisabledStyle : undefined}
//             >
//                 <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: sanitizedThoughts }}></div>
//             </PivotItem>
//             <PivotItem
//                 itemKey={AnalysisPanelTabs.SupportingContentTab}
//                 headerText="Supporting Content"
//                 headerButtonProps={isDisabledSupportingContentTab ? pivotItemDisabledStyle : undefined}
//             >
//                 <div className={styles.thoughtProcess} dangerouslySetInnerHTML={{ __html: "Hi" }}></div>
//             </PivotItem>

//                 <PivotItem
//                     itemKey={AnalysisPanelTabs.Items}
//                     headerText="Items"
//                     headerButtonProps={this.state.articles.length === 0 ? pivotItemDisabledStyle : undefined}
//                 >
//                     <div className={styles.thoughtProcess}>
//                         {this.state.articles.map(article => (
//                             <div key={article.id}>
//                                 <strong>{article.title}</strong><br />
//                                 Precio: ${article.priceInUsDollars}<br />
//                                 Proveedor: {article.providerOrSupplierName}<br />
//                                 Fuente: {article.sourceName}
//                                 <hr />
//                             </div>
//                         ))}
//                     </div>
//                 </PivotItem>

//                 {/* ... other PivotItems ... */}
//             </Pivot>
//         );
//     }
// }
