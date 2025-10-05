'use client';

import { useTheme } from "../(theme)/ThemeContext"; 


export default function dashboard() {

  const { theme, toggleTheme, isDark } = useTheme();
  return (
  <div className={`text-cyan-50`}>  

  god
Lorem ipsum dolor sit amet consectetur adipddfisi Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga praesentium quae pariatur officia sint exercitationem vitae sequi dolore a eos mollitia alias porro, tempora perspiciatis, iure quidem ut possimus architecto?Lorem ipsum, dolor sit amet consectetur adipisicing elit. Suscipit quibusdam nostrum quos, explicabo doloribus, cupiditate optio eos mollitia incidunt illum nesciunt delectus. Inventore, laboriosam! Corporis nisi animi quas veritatis facilis. cing elit. Sunt dicta, sit magni voluptatem molestias enim cum saepe id neque odit. Ut placeat, repellendus laudantium tempora rerum saepe obcaecati quae minus!
  
  </div>
  
  );
}

