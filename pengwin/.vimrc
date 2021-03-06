"font & color settings
set encoding=utf-8
set guifont=Fira\ Code
set t_Co=256
colo ron

"gui settings
set guioptions-=m
set guioptions-=T
set guioptions-=r
set guioptions-=L

"general settings
set number
syntax on
set autoindent
set laststatus=2
set mouse=a

"shortcut settings
set pastetoggle=<F10>
nnoremap <silent> <F4> :bnext<CR>
nnoremap <silent> <F3> :bprev<CR>
nnoremap <C-Left> :tabprevious<CR>
nnoremap <C-Right> :tabnext<CR>
nnoremap <silent> <A-Left> :execute 'silent! tabmove ' . (tabpagenr()-2)<CR>
nnoremap <silent> <A-Right> :execute 'silent! tabmove ' . (tabpagenr()+1)<CR>
"plugins settings
let g:airline_powerline_fonts = 1
let g:airline_theme="minimalist"
let g:airline#extensions#tabline#enabled = 1
let g:airline#extensions#tabline#left_sep = ' '
let g:airline#extensions#tabline#left_alt_sep = '|'

"vundle settings


call plug#begin('~/.vim/plugged')

Plug 'godlygeek/tabular'

Plug 'vim-airline/vim-airline'

Plug 'vim-airline/vim-airline-themes'

Plug 'tpope/vim-fugitive'

call plug#end()
