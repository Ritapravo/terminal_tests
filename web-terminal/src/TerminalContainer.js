import React from 'react';
import './serverList.css';

const ServerList = () => {
    const servers = [
        { id: 1, name: 'Server 1' },
        { id: 2, name: 'Server 2' },
        { id: 3, name: 'Server 3' },
        { id: 4, name: 'Server 4' },
    ];

    return (
        <div className="container">
            <h1 className='welcome-text'>Welcome to Web Terminal...</h1>
            <div className='center'>
                <div className='add-connection'>
                    <h3>
                        Add New Server
                        <i class="fa fa-plus-circle" aria-hidden="true"></i>
                    </h3>
                </div>
            </div>
            <div className='center'>
                <div className='saved-connections-text'>
                    Saved Connections
                </div>
            </div>


            <div className='server-list'>
                {servers.map((server) => (
                    // <li key={server.id}>{server.name}</li>
                    <div className='saved-server'>
                        <h3>
                            {server.name}
                            <i class="fa fa-plus-circle" aria-hidden="true"></i>
                        </h3>
                    </div>
                ))}

            </div>
            {/* <button>Saved Connections</button> */}
        </div>
    );
};

export default ServerList;