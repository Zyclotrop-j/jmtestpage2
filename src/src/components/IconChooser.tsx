import React from 'react';
import styled from 'styled-components';
import { Link } from 'gatsby';
import { Box, InfiniteScroll, TextInput, Button } from 'grommet';
import { transpose, zipObj, memoizeWith, is } from 'ramda';
import Fuse from 'fuse.js';
import metadata from 'grommet-icons/metadata';
import { debounce } from "lodash";
import debounceRender from 'react-debounce-render';

const StyledIcon = styled.span`
  display: inline-block;
  flex: 0 0 auto;
  ${({ size = 'medium', theme }) => `
    width: ${theme.icon.size[size] || size};
    height: ${theme.icon.size[size] || size};
  `}
  color: ${({ color, theme }) => theme?.global?.colors?.icon[color] || theme?.global?.colors[color] || color || theme?.global?.colors?.icon};
  ${({ theme }) => theme && theme.icon.extend}
`;

export class IconChoose extends React.PureComponent<Props> {

  state = {}

  public componentDidMount() {

    const libs = {
      de: () => import(/* webpackPrefetch: true, webpackMode: "lazy" */ "grommet-icons"),

      bl: () =>  import(/* webpackPrefetch: true, webpackMode: "lazy" */ "styled-icons/boxicons-logos"),
      br: () =>  import(/* webpackPrefetch: true, webpackMode: "lazy" */ "styled-icons/boxicons-regular"),
      bs: () =>  import(/* webpackPrefetch: true, webpackMode: "lazy" */ "styled-icons/boxicons-solid"),
      cr: () =>  import(/* webpackPrefetch: true, webpackMode: "lazy" */ "styled-icons/crypto"),
      ev: () =>  import(/* webpackPrefetch: true, webpackMode: "lazy" */ "styled-icons/evil"),
      im: () =>  import(/* webpackPrefetch: true, webpackMode: "lazy" */ "styled-icons/icomoon"),
    };
    const [keys, promises] = transpose(Object.entries(libs).map(([k, v]) => [k, v()]));
    Promise.all(promises).then(libs => {
      const zipped = zipObj(keys, libs);
      this.setState(zipped);
      const iconList = Object.entries(zipped).reduce((p, [libName, icons], idx) => {
        if(!icons) return p;
        return p.concat(
          Object.entries(icons).filter(([__, V]) => React.isValidElement(<V />)).map(([iconName, Icon], jdx) => {
            const iconXName = iconName.substring(2);
            return { libName, iconName, iconXName, Icon, idx: (idx+1)*(jdx+1), meta: metadata[iconName] || [] };
          })
        );
      }, []);
      const options = {
        keys: [
          "iconName",
          "iconXName",
          "meta"
        ],
        shouldSort: true,
        threshold: 0.2,
        location: 0,
      };
      const fuse = new Fuse(iconList, options);
      const search = debounce(term => {
        if(!term || !term.trim()) return;
        const searchResult = term.split(" ").reduce((res, t) => res.concat(fuse.search(t.trim())), []);
        this.setState({
          searchResult,
          searchTerm: term
        });
      }, 500);
      this.setState({
        allIcons: iconList,
        fuse: {
          search: search
        }
      });
    });
  }

  private renderItem = memoizeWith(({ iconName, idx }) => `${iconName}${idx}`, ({ libName, iconName, Icon: someicon, idx }) => {
    let Icon = null;
    if(is(Function, someicon) && is(Function, someicon()?.type?.render)) {
      Icon = someicon;
    }
    if(is(Function, someicon?.type?.render)) {
      Icon = () => someicon;
    }
    if(Icon === null) {
      return <span />;
    }
    return (
      <Box
        direction="row"
        flex={false}
        pad="medium"
        border={{ color: "silver", size: "medium", style: "solid", side: "top" }}
        background="#CCC"
      >
        <Box pad={{ horizontal: "small" }}>{`${libName} - ${iconName} `}</Box>
        <Box background="black" direction="row" pad="small" round>
          <StyledIcon color='brand' size='large'><Icon color='brand' size='large' /></StyledIcon>
          <StyledIcon color='white' size='large'><Icon color='white' size='large' /></StyledIcon>
          <StyledIcon color='accent-1' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
          <StyledIcon color='accent-2' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
          <StyledIcon color='accent-3' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
          <StyledIcon color='accent-4' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
        </Box>
        <Box background="white" direction="row" pad="small" round>
          <StyledIcon color='brand' size='large'><Icon color='brand' size='large' /></StyledIcon>
          <StyledIcon color='black' size='large'><Icon color='black' size='large' /></StyledIcon>
          <StyledIcon color='accent-1' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
          <StyledIcon color='accent-2' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
          <StyledIcon color='accent-3' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
          <StyledIcon color='accent-4' size='large'><Icon color='accent-1' size='large' /></StyledIcon>
        </Box>
        <Button label="Use this icon" onClick={() => this.props.onChange(`${libName}/${iconName}`)}/>
      </Box>
    );
  })

  public render() {
    const { onChange } = this.props;
    const { fa, io, md, ti, go, fi, gi, wi, di, de, searchTerm = "", searchValue="", searchResult = [], allIcons = [] } = this.state;
    const iconList = Object.entries({ fa, io, md, ti, go, fi, gi, wi, di, de }).reduce((p, [libName, icons], idx) => {
      if(!icons) return p;
      return p.concat(
        Object.entries(icons).filter(([iconName]) => /^[A-Z]/.test(iconName)).map(([iconName, Icon], jdx) => {
          return { libName, iconName, Icon, idx: (idx+1)*(jdx+1) };
        })
      );
    }, []);

    const list = searchResult.length ? searchResult : iconList;

    const flist = (searchValue.trim() ? list : allIcons);
    return (<span>
      <div>Current value: <b>{this.props.value}</b></div>
      <TextInput
        placeholder="Search"
        value={searchValue}
        onChange={event => {
          this.state?.fuse?.search(event.target.value);
          this.setState({
            searchValue: event.target.value
          });
        }}
      />
      <Box height="large" overflow="auto">
        {flist.length && <InfiniteScroll step={10} items={flist} replace >
          {this.renderItem}
        </InfiniteScroll>}
      </Box>
    </span>);
  }
}
