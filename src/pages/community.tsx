import * as React from 'react'
import Layout from '../components/layout'
import styled from 'styled-components'

const Wrapper = styled.div`
  font-family: 'Inter';
  margin-top: 200px;
  padding: ${(p) => p.theme.space[40]};
  display: flex;
  flex-direction: column;
  align-items: center;
  h1 {
    font-weight: bold;
  }
`

const Page = () => (
  <Layout>
    <Wrapper>
      <h1>加入Prisma微信群</h1>
      <div style={{margin:'30px'}}>现已建立微信群，聚集Pirsma和GraphQL的爱好者一起交流，因人数限制添加我的微信拉你进入，麻烦备注prisma。</div>
      <img src={"https://www.baasapi.com/image/contact/kwc.png"} alt="prisma" style={{width:'200px',height:'200px'}} />
    </Wrapper>
  </Layout>
)

export default Page
