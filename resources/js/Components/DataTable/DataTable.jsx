import NoDataFound from "@/Components/NoDataFound/NoDataFound";

/**
 * Reusable Data Table Component
 *
 * @param {Array} columns  -> [{ key: "name", label: "Name" }]
 * @param {Array} data     -> [{ id: 1, name: "Example", price: 50 }]
 * @param {Function} renderCell -> optional custom renderer (col, row)
 * @param {JSX.Element} actions -> optional actions column
 */
const DataTable = ({ columns = [], data = [], renderCell, actions }) => {
    return (
        <div className="table-div">
            {data.length === 0 ? (
                <NoDataFound />
            ) : (
                <table className="custom-table">
                    <thead className="custom-thead">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={col.key}
                                    className={`custom-th ${idx === 0 ? "rounded-l-md" : ""} ${
                                        idx === columns.length - 1 && !actions
                                            ? "rounded-r-md"
                                            : ""
                                    }`}
                                >
                                    {col.label}
                                </th>
                            ))}

                            {actions && (
                                <th className="custom-th rounded-r-md">Actions</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((row, rowIndex) => (
                            <tr key={rowIndex} className="custom-body-tr text-center">
                                {columns.map((col) => (
                                    <td key={col.key} className="custom-body-td">
                                        {renderCell
                                            ? renderCell(col, row)
                                            : row[col.key]}
                                    </td>
                                ))}

                                {actions && (
                                    <td className="custom-body-td text-center">
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DataTable;
