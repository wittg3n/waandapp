import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { CaretRightIcon } from '@phosphor-icons/react';
import { NavLink, useLocation } from 'react-router-dom';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { pathname } = useLocation();

  function isActive(url: string) {
    if (url === '/users') {
      return (
        pathname === url ||
        (pathname.startsWith('/users/') &&
          pathname !== '/users/suspended' &&
          pathname !== '/users/reports')
      );
    }
    if (url.startsWith('/data/') && url !== '/data/quality') {
      return pathname === url || pathname.startsWith(`${url}/`);
    }
    return pathname === url;
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive || item.items?.some((subItem) => isActive(subItem.url))}
            className="group/collapsible"
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
              {item.icon}
              <span className="text-[14px]">{item.title}</span>
              <CaretRightIcon className="ms-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      isActive={isActive(subItem.url)}
                      render={
                        subItem.url.startsWith('/') ? (
                          <NavLink to={subItem.url} />
                        ) : (
                          <a href={subItem.url} />
                        )
                      }
                    >
                      <span className="text-[13px]">{subItem.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
