import React from 'react'
import styled from 'styled-components'

function Header() {
    return (
        <HeaderContainer>
            <HeaderTitle>
                <h3>OpenHuddle</h3>
            </HeaderTitle>  
        </HeaderContainer>

    )
}

export default Header

const HeaderContainer = styled.div`
    display: flex;
    position: flex;
    width: 100%;
    align-items: center;
    height: 55px;
    background-color: blue;
    padding: 10px 0px;
    color: black;
`;

const HeaderTitle = styled.div``; 
